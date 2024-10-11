document.addEventListener("DOMContentLoaded", function () {
    const filterSelect = document.getElementById('filter-select');
    const uploadContainer = document.getElementById('upload-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const resultBox = document.getElementById('result-box');

    filterSelect.addEventListener('change', function () {
        if (this.value === 'tweet') {
            uploadContainer.style.display = 'block';
        } else {
            uploadContainer.style.display = 'none';
        }
    });

    // Analyze button event
    analyzeBtn.addEventListener('click', function () {
        const textInput = document.getElementById('text-input').value.trim();
        resultBox.innerHTML = `<p>Analysing...</p>`;
        // check if the input is not empty
        if (textInput) {
            const requestData = {
                query: textInput
            };

            // call the backend API
            fetch('http://127.0.0.1:5001/api/check-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            })
            .then(response => response.json())
            .then(data => {
                resultBox.innerHTML = '';

                // show the result
                if (data.error) {
                    resultBox.innerHTML = `<p>Error: ${data.error}</p>`;
                } else if (data.evaluation) {
                    resultBox.innerHTML = `
                        <p>${data.evaluation.reason}</p>
                    `;
                } else {
                    resultBox.innerHTML = `<p>Unexpected response format received.</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultBox.innerHTML = `<p>There was an error processing your request.</p>`;
            });
        } else {
            resultBox.innerHTML = `<p>Please enter some text to analyze.</p>`;
        }
    });


    // upload button event
    uploadBtn.addEventListener('click', function () {
        const uploadFile = document.getElementById('tweet-upload').files[0];
        if (uploadFile) {
            resultBox.innerHTML = `<p>Uploading tweet...</p>`;
            setTimeout(() => {
                resultBox.innerHTML = `<p>Tweet uploaded successfully and detection is being processed...</p>`;
            }, 1000);
        } else {
            resultBox.innerHTML = `<p>Please select a tweet file to upload.</p>`;
        }
    });
});
