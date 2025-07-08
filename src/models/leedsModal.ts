import { model, models, Schema } from "mongoose";

export interface ILeed {
	firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    time : Date;
    previousSite?: string;
	badges?: string[];
}
const LeedSchema = new Schema<ILeed>(
	{
        firstName: { type: String, default: "N/A" },
        lastName: { type: String, default: "N/A" },
        phoneNumber: { type: String, default: "N/A" },
        time: { type: Date, default: Date.now },
        previousSite: { type: String, default: "N/A" },
		badges : {type: [String], default: ["new"]},
	},
	{
		timestamps: true,
		toJSON: {
			versionKey: false,
			virtuals: true,
			transform: (_, ret) => {
				delete ret._id;
			},
		},
	}
);
const Leed = models.Leed || model("Leed", LeedSchema);
export default Leed;