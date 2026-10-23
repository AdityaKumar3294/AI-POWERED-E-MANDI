
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Product = require("../models/Product");
const Certificate = require("../models/Certificate");
const GradingReport = require("../models/GradingReport");
const Order = require("../models/Order");

// Allowed product grades and statuses
const ALLOWED_GRADES = ["A", "B", "C"];
const ALLOWED_STATUSES = ["available", "sold_out", "inactive"];

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate positive numbers
const isPositiveNumber = (value) => {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0
  );
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can create product listings",
      });
    }

    const {
      name,
      quantity,
      pricePerKg,
      grade,
      certificateId,
      gradingReportId,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      quantity === undefined ||
      pricePerKg === undefined ||
      !grade
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, quantity, pricePerKg and grade are required",
      });
    }

    if (!isPositiveNumber(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number greater than zero",
      });
    }

    if (!isPositiveNumber(pricePerKg)) {
      return res.status(400).json({
        success: false,
        message: "Price per kg must be a number greater than zero",
      });
    }

    if (!ALLOWED_GRADES.includes(grade)) {
      return res.status(400).json({
        success: false,
        message: "Grade must be A, B, or C",
      });
    }

    if (certificateId && !isValidObjectId(certificateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate ID",
      });
    }

    if (gradingReportId && !isValidObjectId(gradingReportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grading report ID",
      });
    }

    const farmerId = req.user.userId;

    if (certificateId && !gradingReportId) {
      return res.status(400).json({
        success: false,
        message:
          "A grading report is required when linking a certificate",
      });
    }

    // Validate grading report
    if (gradingReportId) {
      const gradingReport =
        await GradingReport.findById(gradingReportId);

      if (!gradingReport) {
        return res.status(404).json({
          success: false,
          message: "Grading report not found",
        });
      }

      if (gradingReport.farmerId.toString() !== farmerId) {
        return res.status(403).json({
          success: false,
          message: "You can only use your own grading reports",
        });
      }

      if (gradingReport.grade !== grade) {
        return res.status(400).json({
          success: false,
          message: "Product grade must match the grading report",
        });
      }
    }

    // Validate certificate
    if (certificateId) {
      const certificate = await Certificate.findById(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      if (certificate.farmerId.toString() !== farmerId) {
        return res.status(403).json({
          success: false,
          message: "You can only use your own certificates",
        });
      }

      if (
        !certificate.gradingReportId ||
        certificate.gradingReportId.toString() !==
          gradingReportId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Certificate does not match the selected grading report",
        });
      }

      if (certificate.grade !== grade) {
        return res.status(400).json({
          success: false,
          message: "Product grade must match the certificate grade",
        });
      }

      if (!certificate.valid) {
        return res.status(400).json({
          success: false,
          message: "Cannot link an invalid certificate",
        });
      }
    }

    const product = await Product.create({
      farmerId,
      name: name.trim(),
      quantity: Number(quantity),
      pricePerKg: Number(pricePerKg),
      grade,
      image: req.file ? req.file.filename : null,
      certificateId: certificateId || null,
      gradingReportId: gradingReportId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// GET ALL AVAILABLE PRODUCTS

const getProducts = async (req, res) => {
  try {
    const {
      search,
      grade,
      minPrice,
      maxPrice,
      sortBy,
      order,
    } = req.query;

    const filter = {
      status: "available",
      quantity: { $gt: 0 },
    };

    // Search product names safely.
    if (typeof search === "string" && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.name = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    // Filter by grade.
    if (grade !== undefined) {
      if (!["A", "B", "C"].includes(grade)) {
        return res.status(400).json({
          success: false,
          message: "Grade must be A, B, or C",
        });
      }

      filter.grade = grade;
    }

    // Filter by minimum price.
    if (minPrice !== undefined) {
      if (
        minPrice === "" ||
        !Number.isFinite(Number(minPrice)) ||
        Number(minPrice) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "minPrice must be a non-negative number",
        });
      }

      filter.pricePerKg = {
        ...filter.pricePerKg,
        $gte: Number(minPrice),
      };
    }

    // Filter by maximum price.
    if (maxPrice !== undefined) {
      if (
        maxPrice === "" ||
        !Number.isFinite(Number(maxPrice)) ||
        Number(maxPrice) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "maxPrice must be a non-negative number",
        });
      }

      filter.pricePerKg = {
        ...filter.pricePerKg,
        $lte: Number(maxPrice),
      };
    }

    if (
      filter.pricePerKg?.$gte !== undefined &&
      filter.pricePerKg?.$lte !== undefined &&
      filter.pricePerKg.$gte > filter.pricePerKg.$lte
    ) {
      return res.status(400).json({
        success: false,
        message: "minPrice cannot be greater than maxPrice",
      });
    }

    // Allow only supported sort fields.
    const allowedSortFields = [
      "createdAt",
      "pricePerKg",
      "name",
      "quantity",
    ];

    const selectedSort = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortDirection = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .populate("farmerId", "name location")
      .populate(
        "certificateId",
        "certificateId grade produceName valid issuedAt"
      )
      .populate(
        "gradingReportId",
        "total healthy defective defectPercentage averageSize grade"
      )
      .sort({ [selectedSort]: sortDirection });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};


// GET FARMER'S OWN PRODUCTS
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      farmerId: req.user.userId,
    })
      .populate("farmerId", "name location")
      .populate(
        "certificateId",
        "grade produceName valid issuedAt"
      )
      .populate(
        "gradingReportId",
        "total healthy defective defectPercentage averageSize grade"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get my products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your products",
    });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id)
      .populate("farmerId", "name location")
      .populate(
        "certificateId",
        "certificateId grade produceName valid issuedAt"
      )
      .populate(
        "gradingReportId",
        "total healthy defective defectPercentage averageSize grade"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    const { name, quantity, pricePerKg, grade, status } = req.body;

    const allowedFields = [
      "name",
      "quantity",
      "pricePerKg",
      "grade",
      "status",
    ];

    const suppliedFields = allowedFields.filter(
      (field) => req.body[field] !== undefined
    );

    if (suppliedFields.length === 0 && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field or image to update",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name must be a non-empty string",
        });
      }

      product.name = name.trim();
    }

    if (quantity !== undefined) {
      if (
        quantity === "" ||
        quantity === null ||
        !Number.isFinite(Number(quantity)) ||
        Number(quantity) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be a number greater than or equal to zero",
        });
      }

      product.quantity = Number(quantity);

      if (product.quantity === 0) {
        product.status = "sold_out";
      } else if (product.status === "sold_out") {
        product.status = "available";
      }
    }

    if (pricePerKg !== undefined) {
      if (!isPositiveNumber(pricePerKg)) {
        return res.status(400).json({
          success: false,
          message: "Price per kg must be a number greater than zero",
        });
      }

      product.pricePerKg = Number(pricePerKg);
    }

    if (grade !== undefined) {
      if (!ALLOWED_GRADES.includes(grade)) {
        return res.status(400).json({
          success: false,
          message: "Grade must be A, B, or C",
        });
      }

      if (product.gradingReportId) {
        const report = await GradingReport.findById(
          product.gradingReportId
        );

        if (!report) {
          return res.status(400).json({
            success: false,
            message: "Linked grading report no longer exists",
          });
        }

        if (report.farmerId.toString() !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message:
              "You cannot use another farmer's grading report",
          });
        }

        if (report.grade !== grade) {
          return res.status(400).json({
            success: false,
            message:
              "Product grade must match its grading report",
          });
        }
      }

      if (product.certificateId) {
        const certificate = await Certificate.findById(
          product.certificateId
        );

        if (!certificate) {
          return res.status(400).json({
            success: false,
            message: "Linked certificate no longer exists",
          });
        }

        if (certificate.farmerId.toString() !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message:
              "You cannot use another farmer's certificate",
          });
        }

        if (!certificate.valid) {
          return res.status(400).json({
            success: false,
            message: "Cannot use an invalid certificate",
          });
        }

        if (
          !product.gradingReportId ||
          !certificate.gradingReportId ||
          certificate.gradingReportId.toString() !==
            product.gradingReportId.toString()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Certificate does not match the product's grading report",
          });
        }

        if (certificate.grade !== grade) {
          return res.status(400).json({
            success: false,
            message:
              "Product grade must match its certificate",
          });
        }
      }

      product.grade = grade;
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be available, sold_out, or inactive",
        });
      }

      if (status === "available" && product.quantity === 0) {
        return res.status(400).json({
          success: false,
          message:
            "A product with zero stock cannot be marked available",
        });
      }

      if (status === "sold_out" && product.quantity > 0) {
        return res.status(400).json({
          success: false,
          message:
            "A product with available stock cannot be marked sold_out",
        });
      }

      product.status = status;
    }

    if (req.file) {
      const previousImage = product.image;
      product.image = req.file.filename;

      // Remove the previous image only after saving the new filename.
      // The old file is deleted after a successful database save.
      try {
        await product.save();

        if (previousImage) {
          const previousImagePath = path.join(
            __dirname,
            "../../uploads",
            path.basename(previousImage)
          );

          if (fs.existsSync(previousImagePath)) {
            fs.unlinkSync(previousImagePath);
          }
        }

        return res.status(200).json({
          success: true,
          message: "Product updated successfully",
          product,
        });
      } catch (error) {
        // Keep the previous image file if the database save fails.
        throw error;
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products",
      });
    }

    // Do not delete products that have active orders.
    const existingOrder = await Order.exists({
      productId: product._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete a product with pending or confirmed orders",
      });
    }

    // Delete the database record first so a filesystem issue
    // does not leave the product record missing its image.
    await Product.findByIdAndDelete(product._id);

    // Clean up the image file if it exists.
    if (product.image) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        path.basename(product.image)
      );

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (fileError) {
        console.error(
          "Product deleted, but image cleanup failed:",
          fileError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
