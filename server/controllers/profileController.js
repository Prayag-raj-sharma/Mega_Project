const User = require("../models/User")
const Profile = require("../models/Profile")

// as profile will already being created while creating user
exports.updateProfile = async(req, res) => {
    try {
        const {gender, dateOfBirth="", about="", contactNumber} = req.body;

        const userId = req.user.id;

        if(!userId || !gender || !contactNumber) {
            return res.status(401).json({
                success: false,
                message: "These fields are required"
            })
        }

        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // store it on DB
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails
        })

    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error comes while updating profile",
            error: error.message
        })
    }
}

exports.deleteAccount = async(req, res) => {
    try {
        const userId = req.user.id;

        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "User not loggedIn"
            })
        }

        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete({_id: profileId});
        await User.findByIdAndDelete({_id: userId});

        return res.status(200).json({
            success: true, 
            message: "Account deleted successfully"
        })

    }
    catch(error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error comes while deleting an account",
            error: error.message
        })
    }
}