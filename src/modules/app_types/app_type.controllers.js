const AppType = require('../../models/app_type_model');
const { appTypeSchema } = require('./app_types.validators');
const  response_handler  = require('../../helpers/response_handler');

const createAppType = async (req, res) => {
    try {
        const { error } = appTypeSchema.validate(req.body);
        if (error) {
            return response_handler(res, 400, error.details[0].message, null);
        }

        const appType = new AppType(req.body);
        await appType.save();

        return response_handler(res, 201, 'App type created successfully', appType);
    } catch (error) {
        return response_handler(res, 500, error.message, null);
    }
};

const getAllAppTypes = async (req, res) => {
    try {
        const appTypes = await AppType.find();
        return response_handler(res,200, 'App types fetched successfully',  appTypes);
    } catch (error) {
        return response_handler(res, 500, error.message, null);
    }
};

const getAppTypeById = async (req, res) => {
    try {
        const appType = await AppType.findById(req.params.id);
        return response_handler(res, 200, 'App type fetched successfully', appType);
    } catch (error) {
        return response_handler(res, 500, error.message, null);
    }
};

const updateAppType = async (req, res) => {
    try {
        const appType = await AppType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return response_handler(res, 200, 'App type updated successfully', appType);
    } catch (error) {
        return response_handler(res, 500, error.message, null);
    }
};

const deleteAppType = async (req, res) => {
    try {
        await AppType.findByIdAndDelete(req.params.id);
        return response_handler(res, 200, 'App type deleted successfully', null);
    } catch (error) {
        return response_handler(res, 500, error.message, null);
    }
};

// function replaceBaseUrl(url) {
//     if (!url) return url;
  
//     // Use regex to strip domain part and replace with new base
//     return url.replace(/^https?:\/\/[^/]+/, "http://13.127.95.200");
//   }
  
//   async function updateUrls() {
//         const docs = await AppType.find({ icon: { $regex: "api-uat-loyalty.xyvin.com" } });
  
//     for (const doc of docs) {
//       doc.icon = replaceBaseUrl(doc.icon);
//       await doc.save();
//     }
  
//     console.log("Updated all URLs successfully");
//   }
  
//   updateUrls();

module.exports = {
    createAppType,
    getAllAppTypes,
    getAppTypeById,
    updateAppType,
    deleteAppType
};








