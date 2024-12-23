import axios from "axios";
import { Request, Response } from "express";
import { Account } from "../models/account";
import { ProjectModel, ScanHistoryModel, TicketModel, UserModel } from "../models/models";
import { Ticket } from "../models/ticket";
import { errorResponse, successResponse } from "../utils/responseFormat";
import { sendNotification } from "./notification.controller";

export async function receivedOwaspReports(req: Request, res: Response) {
    try {
        const { dependencies, projectInfo } = req.body;

        /// biểu thức không chính quy dễ bị tấn công
        const project = await ProjectModel.findOne({ name: { $regex: new RegExp(`/${projectInfo.name}$`, "i") } });

        // sửa lại biểu thức tránh tấn công
        // const { projectName } = req.query;

        // const project = await ProjectModel.findOne({ name: projectName });

        // const { dependencies } = req.body;

        let totalTickets: Ticket[] = [];

        for (const element of dependencies) {
            const cveIds = element.vulnerabilities.map((vuln: any) => vuln.name).sort().join('_');

            const identifier = `${element.fileName}-${cveIds}`;

            try {
                const existingTicket = await TicketModel.findOne({ uniqueIdentifier: identifier });

                if (!existingTicket) {


                    const newTicket = await TicketModel.create({
                        title: element.fileName,
                        createBy: 'owasp',
                        priority: getHighestOwaspPriority(element.vulnerabilities),
                        projectName: project?.name,
                        targetedVulnerability: element.vulnerabilities.map((vuln: any) => {
                            const vulnData = {
                                cveId: vuln.name,
                                description: vuln.description || "No description provided",
                                score: vuln.cvssv3?.baseScore || vuln.cvssv2?.score || undefined,
                                severity: vuln.severity?.toLowerCase() || "low",
                                cwes: vuln.cwes || [],
                            }

                            return vulnData;
                        }),
                        uniqueIdentifier: identifier,
                    });

                    totalTickets.push(newTicket as Ticket);
                }


            } catch (error) {
                console.error(error);
            }
        };

        const description = `OWASP Dependency Check workflow run completed with ${totalTickets.length} new tickets`;

        ScanHistoryModel.create({
            projectName: project?.name,
            description: description,
            createBy: 'owasp',
            totalTicketAdded: totalTickets,
        });

        sendNotificationToUser(project?.name ?? '', description);

        sendTicketNotificationToUser(project?.name ?? '', totalTickets);

        return res.json(successResponse(null, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }
}

function evaluateOwaspPriority(vulnerability: any): string {
    const cvssScore = vulnerability.cvssv3?.baseScore || vulnerability.cvssv2?.score || 0;

    if (cvssScore >= 7.0) {
        return "high";
    } else if (cvssScore >= 4.0) {
        return "medium";
    } else {
        return "low";
    }
}

function getHighestOwaspPriority(vulnerabilities: any): string {
    if (!vulnerabilities || vulnerabilities.length === 0) {
        return "low";
    }

    const priorityOrder = ["high", "medium", "low"];

    // Lấy tất cả độ ưu tiên và sắp xếp theo thứ tự giảm dần
    const priorities = vulnerabilities.map((vuln: any) =>
        evaluateOwaspPriority(vuln)
    );

    // Tìm mức độ ưu tiên cao nhất theo thứ tự
    // bằng cách sort index và lấy phần tử đầu tiên (phần tử lớn nhất)
    return priorities.sort(
        (a: string, b: string) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
    )[0];
}

export async function receivedTrivyReports(req: Request, res: Response) {
    try {
        const { projectName } = req.query;

        const project = await ProjectModel.findOne({ name: projectName });

        const { Results: results } = req.body;

        let totalTickets: Ticket[] = [];

        for (const element of results) {
            const cveIds = element.Vulnerabilities.map((vuln: any) => vuln.VulnerabilityID).sort().join('_');

            const identifier = `${element.Target}-${cveIds}`;

            try {
                const existingTicket = await TicketModel.findOne({ uniqueIdentifier: identifier });

                if (!existingTicket) {


                    const newTicket = await TicketModel.create({
                        title: element.Target,
                        createBy: 'trivy',
                        priority: getHighestTrivyPriority(element.vulnerabilities),
                        projectName: project?.name,
                        targetedVulnerability: element.Vulnerabilities.map((vuln: any) => {
                            const vulnData = {
                                cveId: vuln.VulnerabilityID,
                                description: vuln.Description || "No description provided",
                                score: vuln.CVSS?.nvd?.V3Score || vuln.CVSS?.redhat?.V3Score || undefined,
                                severity: vuln.Severity?.toLowerCase() || "low",
                                cwes: vuln.CweIDs || [],
                            }

                            return vulnData;
                        }),
                        uniqueIdentifier: identifier,
                    });

                    totalTickets.push(newTicket as Ticket);
                }
            } catch (error) {
                console.error(error);
            }
        };

        const description = `Trivy workflow run completed with ${totalTickets.length} new tickets`;

        ScanHistoryModel.create({
            projectName: projectName,
            description: description,
            createBy: 'trivy',
            totalTicketAdded: totalTickets,
        });

        sendNotificationToUser(projectName as string, description);
        sendTicketNotificationToUser(projectName as string, totalTickets);

        return res.json(successResponse(null, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }

}

function evaluateTrivyPriority(vulnerability: any): string {
    const cvssScore = vulnerability.CVSS?.nvd?.V3Score || vulnerability.CVSS?.redhat?.V3Score || 0;

    if (cvssScore >= 7.0) {
        return "high";
    } else if (cvssScore >= 4.0) {
        return "medium";
    } else {
        return "low";
    }
}

function getHighestTrivyPriority(vulnerabilities: any): string {
    if (!vulnerabilities || vulnerabilities.length === 0) {
        return "low";
    }

    const priorityOrder = ["high", "medium", "low"];

    // Lấy tất cả độ ưu tiên và sắp xếp theo thứ tự giảm dần
    const priorities = vulnerabilities.map((vuln: any) =>
        evaluateTrivyPriority(vuln)
    );

    // Tìm mức độ ưu tiên cao nhất theo thứ tự
    // bằng cách sort index và lấy phần tử đầu tiên (phần tử lớn nhất)
    return priorities.sort(
        (a: string, b: string) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
    )[0];
}

const sonarUrl = process.env.SONAR_CLOUD_URL;

const headers = {
    'Authorization': `Bearer ${process.env.SONAR_CLOUD_API_TOKEN}`
}

export async function receivedSonarReports(req: Request, res: Response) {
    try {
        const { sonarProjectKey, projectName } = req.query;

        const response = await axios.get(`${sonarUrl}/issues/search?componentKeys=${sonarProjectKey}&statuses=OPEN&types=VULNERABILITY`, {
            headers: headers,
        });

        let totalTickets: Ticket[] = [];

        for (const issue of response.data.issues) {
            const uniqueId = `${issue.key}_${issue.rule}`;

            const issueData = await TicketModel.findOne({ uniqueIdentifier: uniqueId });

            if (!issueData) {


                const newTicket = await TicketModel.create({
                    projectName: projectName,
                    title: issue.message,
                    priority: evaluateSonarPriority(issue.severity),
                    sonarIssueKey: issue.key,
                    status: issue.status.toLowerCase(),
                    type: 'sonar',
                    createBy: 'sonar',
                    uniqueIdentifier: uniqueId,
                    description: issue.flows.map((flow: any) => flow.locations.map((location: any) => `Component: ${location.component}\nLine: ${location.textRange.startLine}\nMessage: ${location.msg || ''}`).join('\n\n')).join('\n\n'),
                });

                totalTickets.push(newTicket as Ticket);
            }
        };

        const description = `Sonar workflow run completed with ${totalTickets} new tickets`;

        ScanHistoryModel.create({
            projectName: projectName,
            description: description,
            createBy: 'sonar',
            totalTicketAdded: totalTickets,
        });

        sendNotificationToUser(projectName as string, description);
        sendTicketNotificationToUser(projectName as string, totalTickets);



        return res.json(successResponse(null, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }
}

function evaluateSonarPriority(severity: string): string {
    if (['critical', 'high'].includes(severity.toLowerCase())) {
        return "high";
    } else if (severity.toLowerCase() === "medium") {
        return "medium";
    } else {
        return "low";
    }
}

async function sendNotificationToUser(projectName: string, description: string) {
    const project = await ProjectModel.findOne({ name: projectName });

    if (project) {
        const users = await UserModel.find({ projectIn: project._id }).populate({
            path: "account",
        });

        for (const user of users) {
            const account = user.account as Account;

            if (account.fcmToken) {
                sendNotification({
                    receiver: account._id,
                    title: 'New report',
                    createBy: 'system',
                    content: description,
                    type: 'vulnerability',
                }, account.fcmToken!,
                );
            }

        }
    }
}

async function sendTicketNotificationToUser(projectName: string, tickets: Ticket[]) {
    const project = await ProjectModel.findOne({ name: projectName });

    if (project) {
        const users = await UserModel.find({ projectIn: project._id }).populate({
            path: "account",
        });

        for (const ticket of tickets) {
            for (const user of users) {
                const account = user.account as Account;

                if (account.fcmToken) {
                    sendNotification({
                        receiver: account._id,
                        title: 'New ticket',
                        createBy: 'system',
                        content: ticket.title,
                        type: 'ticket',
                    }, account.fcmToken!,
                    );
                }
            }
        }
    }
}
