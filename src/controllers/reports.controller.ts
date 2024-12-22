import { Request, Response } from "express";
import { ProjectModel, TicketModel } from "../models/models";
import { errorResponse, successResponse } from "../utils/responseFormat";

export async function receivedOwaspReports(req: Request, res: Response) {
    try {
        const { dependencies, projectInfo } = req.body;

        const project = await ProjectModel.findOne({ name: { $regex: new RegExp(`/${projectInfo.name}$`, "i") } });

        dependencies.forEach(async (element: any) => {
            const cveIds = element.vulnerabilities.map((vuln: any) => vuln.name);

            const identifier = `${element.fileName}-${cveIds}`;

            try {
                const existingTicket = await TicketModel.findOne({ uniqueIdentifier: identifier });

                if (!existingTicket) {
                    TicketModel.create({
                        title: element.fileName,
                        createBy: 'owasp',
                        priority: getHighestPriority(element.vulnerabilities),
                        projectName: project?.name,
                        targetedVulnerability: element.vulnerabilities.map((vuln: any) => {
                            const vulnData = {
                                cveId: vuln.name,
                                description: vuln.description || "No description provided",
                                score: vuln.cvssv3?.baseScore || vuln.cvssv2?.score || undefined,
                                severity: vuln.severity || "low",
                                cwes: vuln.cwes || [],
                            }

                            return vulnData;
                        }),
                        uniqueIdentifier: identifier,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        });


        return res.json(successResponse(null, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }
}

function evaluatePriority(vulnerability: any): string {
    const cvssScore = vulnerability.cvssv3?.baseScore || vulnerability.cvssv2?.score || 0;

    if (cvssScore >= 7.0) {
        return "high";
    } else if (cvssScore >= 4.0) {
        return "medium";
    } else {
        return "low";
    }
}

function getHighestPriority(vulnerabilities: any): string {
    if (!vulnerabilities || vulnerabilities.length === 0) {
        return "low";
    }

    const priorityOrder = ["high", "medium", "low"];

    // Lấy tất cả độ ưu tiên và sắp xếp theo thứ tự giảm dần
    const priorities = vulnerabilities.map((vuln: any) =>
        evaluatePriority(vuln)
    );

    // Tìm mức độ ưu tiên cao nhất theo thứ tự
    // bằng cách sort index và lấy phần tử đầu tiên (phần tử lớn nhất)
    return priorities.sort(
        (a: string, b: string) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
    )[0];
}