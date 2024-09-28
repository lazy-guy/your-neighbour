import React, { useRef, useEffect, useState } from "react";

const WebcamFeed = ({updateStep}) => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [stream, setStream] = useState(null);
	const [imageCaptured, setImageCaptured] = useState(false); // State to toggle between video and image

	// Function to start the webcam stream
	const startWebcam = async () => {
		try {
			const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
			setStream(videoStream); // Save the stream in the state
			if (videoRef.current) {
				videoRef.current.srcObject = videoStream; // Assign the stream to the video element
			}
		} catch (error) {
			console.error("Error accessing the webcam: ", error);
		}
	};

	// Function to stop the webcam stream
	const stopWebcam = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null); // Clear the stream state
		}
	};

	// Function to capture an image from the video feed
	const captureImage = () => {
		console.log("yoyo");
		if (canvasRef.current && videoRef.current) {
			const context = canvasRef.current.getContext("2d");
			context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
			setImageCaptured(true); // Switch to show the captured image
			stopWebcam(); // Stop the webcam feed after capturing
			sendImage();
		}
	};

	const sendImage = () => {
		if (canvasRef.current) {
			console.log("yoyoyoyo");
			canvasRef.current.toBlob((blob) => {
				const formData = new FormData();
				formData.append("file", blob, "image.jpg"); // Append the Blob to FormData

				// Sending the image via fetch
                const context = canvasRef.current.getContext("2d");
				fetch("http://swift.local:8000/spoofing", {
					method: "POST",
					body: formData,
				})
					.then((response) => response.json())
					.then((data) => {
						console.log("Image uploaded successfully:", data);
                        context.lineWidth = 10
                        context.strokeStyle = data.validity ? "green" : "red";
                        data.faces?.forEach(face => {
                            context.strokeRect(face.x, face.y, face.w, face.h)
                        })
                        if(data.validity) {
                            updateStep(2);
                        }
					})
					.catch((error) => {
						console.error("Error uploading the image:", error);
					});
			}, "image/jpg");
		}
	};

	// Function to resume the webcam stream
	const resumeWebcam = () => {
		setImageCaptured(false); // Reset the captured image state
		startWebcam(); // Restart the webcam stream
	};

	useEffect(() => {
		if (!imageCaptured) {
			startWebcam(); // Start the webcam on component mount if no image is captured
		}

		// Clean up the stream when the component unmounts
		return () => {
			stopWebcam();
		};
	}, [imageCaptured]); // Restart webcam only when imageCaptured state changes

	return (
		<div>
			<h1>Webcam Capture</h1>
			<video ref={videoRef} autoPlay width="640" height="480" style={{ display: imageCaptured ? "none" : "block" }} />
			<canvas
				ref={canvasRef}
				width="640"
				height="480"
				style={{ display: imageCaptured ? "block" : "none", marginTop: "20px", border: "1px solid black" }}
			/>

			<div style={{ marginTop: "20px" }}>
				{!imageCaptured ? (
					// Show the "Capture Image" button when the video is active
					<button onClick={captureImage}>Capture Image</button>
				) : (
					// Show the "Resume Webcam" button after an image is captured
					<button onClick={resumeWebcam}>Resume Webcam</button>
				)}
			</div>
		</div>
	);
};

export default WebcamFeed;
