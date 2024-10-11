# Check if Python is installed
Write-Host "Checking Python installation..."
$pythonPath = Get-Command python | Select-Object -ExpandProperty Definition
if (-not $pythonPath) {
    Write-Host "Python is not installed. Please install Python and try again."
    Exit
} else {
    Write-Host "Python found at: $pythonPath"
}

# Create virtual environment
Write-Host "Creating virtual environment..."
python -m venv venv

# Activate the virtual environment without changing execution policies
Write-Host "Activating virtual environment on Windows..."
& .\venv\Scripts\Activate

Write-Host "Virtual environment setup and activation complete!"
