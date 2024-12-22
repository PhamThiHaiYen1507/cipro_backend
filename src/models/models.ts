import { getModelForClass } from "@typegoose/typegoose";
import { Account } from "./account";
import { ActivityHistory } from "./activityHistory";
import { Artifact } from "./artifact";
import { ChangeHistory } from "./changeHistory";
import { CWE } from "./cwe";
import { Notification } from "./notification";
import { Phase } from "./phase";
import { PhaseTemplate } from "./phaseTemplate";
import { Project } from "./project";
import { ResolutionHistory } from "./resolutionHistory";
import { Scanner } from "./scanner";
import { Task } from "./task";
import { ThirdParty } from "./thirdParty";
import { Threat } from "./threat";
import { Ticket } from "./ticket";
import { User } from "./user";
import { Vulnerability } from "./vulnerability";

const AccountModel = getModelForClass(Account);
const ActivityHistoryModel = getModelForClass(ActivityHistory);
const ArtifactModel = getModelForClass(Artifact);
const CWEModel = getModelForClass(CWE);
const PhaseModel = getModelForClass(Phase);
const PhaseTemplateModel = getModelForClass(PhaseTemplate);
const ProjectModel = getModelForClass(Project);
const TaskModel = getModelForClass(Task);
const ThirdPartyModel = getModelForClass(ThirdParty);
const ThreatModel = getModelForClass(Threat);
const TicketModel = getModelForClass(Ticket);
const UserModel = getModelForClass(User);
const VulnerabilityModel = getModelForClass(Vulnerability);
const ScannerModel = getModelForClass(Scanner);
const ResolutionHistoryModel = getModelForClass(ResolutionHistory);
const ChangeHistoryModel = getModelForClass(ChangeHistory);
const NotificationModel = getModelForClass(Notification);
export {
  AccountModel,
  ActivityHistoryModel,
  ArtifactModel, ChangeHistoryModel, CWEModel, NotificationModel, PhaseModel,
  PhaseTemplateModel,
  ProjectModel, ResolutionHistoryModel, ScannerModel, TaskModel,
  ThirdPartyModel,
  ThreatModel,
  TicketModel,
  UserModel,
  VulnerabilityModel
};

