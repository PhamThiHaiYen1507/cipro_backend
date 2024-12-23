import { prop, Ref } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Account } from "./account";

export interface Artifact extends Base { }

export class Notification extends TimeStamps {
    @prop({ type: String })
    public title?: string;

    @prop({ type: String })
    public content?: string;

    @prop({ required: true, type: String })
    public createBy!: string;

    @prop({ type: String, required: true })
    public type!: string;

    @prop({ ref: () => Account, required: true })
    public receiver!: Ref<Account>;
}