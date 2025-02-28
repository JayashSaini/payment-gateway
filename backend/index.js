require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
	cors({
		origin: "*",
	})
);

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to create an order
app.post("/razorpay", async (req, res) => {
	try {
		const options = {
			amount: 9900, // ₹99 in paise
			currency: "INR",
			receipt: "txn_" + Date.now(),
		};

		const order = await razorpay.orders.create(options);
		res.status(201).json({
			orderId: order.id,
			amount: order.amount,
			currency: order.currency,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// API to verify payment
app.post("/razorpay/verify", (req, res) => {
	const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
		req.body;

	const generatedSignature = crypto
		.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
		.update(razorpay_order_id + "|" + razorpay_payment_id)
		.digest("hex");

	if (generatedSignature === razorpay_signature) {
		return res.status(200).json({
			success: true,
			message: "Payment verified successfully",
		});
	} else {
		return res
			.status(400)
			.json({ success: false, message: "Invalid signature" });
	}
});

app.get("/healthcheck", function (req, res) {
	res.status(200).json({
		success: true,
		message: "Server is running",
	});
});
app.listen(8000, () => console.log("Server running on port 8000"));
