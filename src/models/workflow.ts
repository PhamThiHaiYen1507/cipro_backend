
import { ArraySubDocumentType, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { WorkflowRun } from "./workflowRun";

export interface Workflow extends Base { }

export class Workflow {
    @prop({ required: true, type: String })
    public id!: string;

    @prop({ required: true, type: String })
    public nodeId!: string; // Node ID của workflow

    @prop({ required: true, type: String })
    public name!: string; // Tên của workflow

    @prop({ required: true, type: String })
    public path!: string; // Đường dẫn tới file workflow trong repository

    @prop({ required: true, type: String })
    public state!: string; // Trạng thái của workflow ("active" hoặc "inactive")

    @prop({ required: true, type: String })
    public createdAt!: string; // Ngày tạo workflow (ISO 8601 format)

    @prop({ type: String })
    public updatedAt?: string; // Ngày cập nhật workflow (ISO 8601 format)

    @prop({ required: true, type: String })
    public url!: string; // API URL để lấy thông tin chi tiết workflow

    @prop({ required: true, type: String })
    public htmlUrl!: string; // Đường dẫn HTML của workflow trên GitHub

    @prop({ required: true, type: String })
    public badgeUrl!: string; // Đường dẫn URL của badge workflow

    @prop({ required: true, type: Number })
    public totalRuns!: number;

    @prop({ required: true, type: () => WorkflowRun, default: [] })
    public runs!: ArraySubDocumentType<WorkflowRun>[];
}