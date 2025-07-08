import { model, models, Schema } from "mongoose";

export interface IUser {
	firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phoneNumber?: string;
    privileges?: [string];
    isBlocked?: boolean;
    createdTime?: Date;
}
const UserSchema = new Schema<IUser>(
	{
        firstName: { type: String, default: "N/A" },
        lastName: { type: String, default: "N/A" },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, default: "N/A" },
        privileges: { type: [String], default: ["view-leeds"] },
        isBlocked: { type: Boolean, default: false },
        createdTime: { type: Date, default: Date.now },
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
const User = models.User || model("User", UserSchema);
export default User;