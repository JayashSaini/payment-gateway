/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { FaCoffee } from "react-icons/fa";
import axios from "axios";

function loadScript(src: string): Promise<boolean> {
	return new Promise((resolve) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

declare global {
	interface Window {
		Razorpay: any;
	}
}

const App = () => {
	const [loading, setLoading] = useState(false);

	async function displayRazorpay() {
		setLoading(true);

		const res = await loadScript(
			"https://checkout.razorpay.com/v1/checkout.js"
		);
		if (!res) {
			alert("Razorpay SDK failed to load. Please check your connection.");
			setLoading(false);
			return;
		}

		try {
			const { data } = await axios.post("http://localhost:8000/razorpay");

			const options = {
				key: import.meta.env.VITE_RAZORPAY_KEY,
				amount: data.amount,
				currency: data.currency,
				name: "Buy Me a Coffee",
				description: "Support my work!",
				order_id: data.orderId,
				handler: async (response: any) => {
					const { data } = await axios.post(
						"http://localhost:8000/razorpay/verify",
						response
					);
					alert(data.message);
				},
				theme: { color: "#C0C0C0" }, // Silver color
			};

			const paymentObject = new window.Razorpay(options);
			paymentObject.open();
		} catch (error: any) {
			alert(error.message || "Something went wrong. Please try again!");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-screen min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
			<div className="absolute inset-0 bg-zinc-900 bg-opacity-30 backdrop-blur-2xl"></div>
			<div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-2xl shadow-2xl text-center w-[90%] sm:w-96 border border-zinc-600 bg-opacity-60 backdrop-blur-md">
				<FaCoffee className="text-6xl text-zinc-300 mx-auto drop-shadow-lg" />
				<h1 className="text-4xl font-bold mt-3 text-zinc-100 tracking-wide">
					Buy Me a Coffee
				</h1>
				<p className="text-zinc-400 mt-2 text-lg">
					Fuel my creativity with a coffee! ☕
				</p>

				<button
					onClick={displayRazorpay}
					disabled={loading}
					className={`mt-5 px-8 py-3 text-lg font-semibold rounded-xl shadow-md transition-all duration-300 focus:outline-none transform hover:scale-105 active:scale-95 relative overflow-hidden 
						${
							loading
								? "bg-zinc-500 cursor-not-allowed"
								: "bg-gradient-to-r from-zinc-300 to-zinc-500 text-black hover:from-zinc-400 hover:to-zinc-600"
						}`}
				>
					<span className="absolute inset-0 bg-zinc-100 opacity-10 rounded-xl"></span>
					{loading ? "Brewing..." : "Buy me a Coffee - ₹99"}
				</button>

				<a
					href="https://jayash-dev.vercel.app/"
					target="_blank"
					rel="noreferrer"
					className="block mt-5 text-sm text-zinc-400 hover:text-zinc-200 transition"
				>
					✨ Dive into My Creations ✨
				</a>
			</div>
		</div>
	);
};

export default App;
