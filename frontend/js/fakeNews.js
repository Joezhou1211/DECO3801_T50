document.addEventListener("DOMContentLoaded", function () {
    const filterSelect = document.getElementById('filter-select');
    const uploadContainer = document.getElementById('upload-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const resultBox = document.getElementById('result-box');

    // 根据选择的类型展示或隐藏推文上传
    filterSelect.addEventListener('change', function () {
        if (this.value === 'tweet') {
            uploadContainer.style.display = 'block'; // 显示上传推文部分
        } else {
            uploadContainer.style.display = 'none'; // 隐藏上传推文部分
        }
    });

    // Analyze 按钮事件
    analyzeBtn.addEventListener('click', function () {
        const textInput = document.getElementById('text-input').value.trim();
        resultBox.innerHTML = `<p>Detecting fake news...</p>`;

        if (textInput) {
            // 创建请求体
            const requestData = {
                query: textInput
            };

            // 发送请求到后端API
            fetch('http://127.0.0.1:5000/check-news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            })
            .then(response => response.json())
            .then(data => {
                // 处理后端返回的数据
                if (data.error) {
                    resultBox.innerHTML = `<p>Error: ${data.error}</p>`;
                } else if (data.message) {
                    resultBox.innerHTML = `<p>${data.message}</p>`;
                } else {
                    // 展示分析结果
                    resultBox.innerHTML = `<h3>Detection Results:</h3>`;
                    data.forEach(item => {
                        resultBox.innerHTML += `
                            <div class="result-item">
                                <h4>${item.title}</h4>
                                <p>Source: ${item.source}</p>
                                <p>Similarity Score: ${item.similarity_score}</p>
                                <p>Source Trustworthiness: ${item.source_trustworthiness}</p>
                                <p>Credibility Score: ${item.credibility_score}</p>
                                <a href="${item.url}" target="_blank">Read more</a>
                            </div>
                            <hr>
                        `;
                    });
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

    // 上传推文按钮事件
    uploadBtn.addEventListener('click', function () {
        const uploadFile = document.getElementById('tweet-upload').files[0];
        if (uploadFile) {
            resultBox.innerHTML = `<p>Uploading tweet...</p>`;
            // 模拟文件上传
            setTimeout(() => {
                resultBox.innerHTML = `<p>Tweet uploaded successfully and detection is being processed...</p>`;
            }, 1000);
        } else {
            resultBox.innerHTML = `<p>Please select a tweet file to upload.</p>`;
        }
    });
});
