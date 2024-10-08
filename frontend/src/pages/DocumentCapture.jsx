import React, { useContext, useState } from "react";
import { DocumentContext, PhotoContext } from "../utils/contexts.js";
import { Link, Navigate } from "react-router-dom";
import Header from "../component/Header.jsx";

const DocumentCapture = () => {
	const [file, setFile] = useState(null); // State to store the uploaded file
	const [previewUrl, setPreviewUrl] = useState(null); // State to store image preview URL
	const [validity, setValidity] = useState(false);
	const [loading, setLoading] = useState(false);
	const [photo, setPhoto] = useContext(PhotoContext);
	const [document, setDocument] = useContext(DocumentContext);

	if (photo == null) {
		return <Navigate to="/capture" replace={true} />;
	}

	// Handle file input change
	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			setValidity(false);
			setFile(selectedFile);
			setPreviewUrl(URL.createObjectURL(selectedFile)); // Create a preview URL for the selected image
		}
	};

	// Function to send the image via fetch
	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!file) {
			alert("Please upload an image file.");
			return;
		}

		const formData = new FormData();
		formData.append("photo", file); // Append the file to FormData

		setLoading(true);

		try {
			const response = await fetch("http://swift.local:8000/countfaces/", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();
				console.log("Image uploaded successfully:", result);
				if (result) {
					setDocument(file);
					setValidity(true);
				} else {
					setDocument(null);
					setValidity(false);
				}
			} else {
				console.error("Upload failed:", response.statusText);
				setDocument(null);
				setValidity(false);
			}
			setLoading(false);
		} catch (error) {
			console.error("Error uploading the image:", error);
			alert("An error occurred while uploading the image.");
			setLoading(false);
			setDocument(null);
			setValidity(false);
		}
	};

	return (
		<>
			<Header />
			<main>
				<h1>Upload ID Card Image</h1>

				<form onSubmit={handleSubmit}>
					<div>
						<label>
							Select an image to upload:
							<br />
							<input type="file" accept="image/*" onChange={handleFileChange} />
						</label>
					</div>

					{/* Show image preview if a file is selected */}
					{previewUrl && (
						<div style={{ marginTop: "20px" }}>
							<p>Image Preview:</p>
							<img className="user-image" src={previewUrl} alt="Preview" width="300" />
						</div>
					)}

					<div style={{ marginTop: "20px", display: "flex", alignItems: "center", flexDirection: "column" }}>
						{loading ? (
							<div className="loader"></div>
						) : validity ? (
							<>
								<h3>ID Checked</h3>
								<Link to={"/match"}>Verify ID and Photo</Link>
							</>
						) : (
							<button type="submit">Check Image</button>
						)}
					</div>
				</form>
			</main>
		</>
	);
};

export default DocumentCapture;
