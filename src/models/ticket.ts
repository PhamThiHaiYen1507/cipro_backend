import { ArraySubDocumentType, post, prop, Ref } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ChangeHistoryModel, UserModel } from "./models";
import { User } from "./user";
import { Vulnerability } from "./vulnerability";
export interface Ticket extends Base { }
@post<Ticket>("deleteMany", async function (res, next) {
  // Remove tickets from UserModel's ticketAssigned field
  await UserModel.updateMany({
    $pull: {
      ticketAssigned: {
        $in: res._id,
      },
    },
  });
  await ChangeHistoryModel.deleteMany({ objectId: res._id });
})
export class Ticket extends TimeStamps {
  @prop({ required: true, type: String })
  public title!: string;

  @prop({ ref: () => User })
  public assignee?: Ref<User>;

  @prop({ ref: () => User })
  public assigner?: Ref<User>;

  @prop({
    required: true,
    enum: ["open", "closed"],
    default: "open",
    type: String,
  })
  public status!: string;

  @prop({ type: String })
  public description?: string;

  @prop({
    required: true,
    enum: ["low", "medium", "high"],
    default: "low",
    type: String,
  })
  public priority!: string;

  @prop({ type: () => Vulnerability, default: [], required: true })
  public targetedVulnerability!: ArraySubDocumentType<Vulnerability>[];

  @prop({ required: true, type: String })
  public projectName!: string;

  @prop({ type: String, default: 'system' })
  public createBy!: string

  @prop({ type: String, unique: true, sparse: true })
  public uniqueIdentifier?: string;
}
