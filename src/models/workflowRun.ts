import { prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Expose } from "class-transformer";

export interface WorkflowRun extends Base { }

export class WorkflowRun {
    @Expose({ name: "id" })
    @prop({ required: true, type: String })
    public id!: string;

    @Expose({ name: "node_id" })
    @prop({ required: true, type: String })
    public nodeId!: string;

    @Expose({ name: "name" })
    @prop({ required: true, type: String })
    public name!: string;

    @Expose({ name: "path" })
    @prop({ required: true, type: String })
    public path!: string;

    @Expose({ name: "state" })
    @prop({ required: true, type: String })
    public state!: string;

    @Expose({ name: "created_at" })
    @prop({ required: true, type: String })
    public createdAt!: string;

    @Expose({ name: "updated_at" })
    @prop({ required: true, type: String })
    public updatedAt?: string;

    @Expose({ name: "event" })
    @prop({ required: true, type: String })
    public event!: string;

    @Expose({ name: "status" })
    @prop({ required: true, type: String })
    public status!: string;

    @Expose({ name: "conclusion" })
    @prop({ required: true, type: String })
    public conclusion!: string;

    @Expose({ name: "workflow_id" })
    @prop({ required: true, type: String })
    public workflowId!: string;

    @Expose({ name: "display_title" })
    @prop({ required: true, type: String })
    public displayTitle!: string;
}
