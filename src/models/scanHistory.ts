import { prop } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
export interface ScanHistory extends Base { }
export class ScanHistory extends TimeStamps {
    @prop({ required: true, type: String })
    public description!: string;

    @prop({ required: true, type: String, default: 0 })
    public totalTicketAdded!: number;

    @prop({ required: true, type: String })
    public createBy!: string;

    @prop({ required: true, type: String })
    public projectName!: string;

}
