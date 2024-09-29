document.getElementById('attendanceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            const attendance = result.attendance;

            document.getElementById('result').innerHTML = `
                <strong>Message:</strong> ${result.message} <br>
                <strong>Full Name:</strong> ${attendance.fullName} <br>
                <strong>Enrollment Number:</strong> ${attendance.enrollmentNumber} <br>
                <strong>Present Count:</strong> ${attendance.present} <br>
                <strong>Absent Count:</strong> ${attendance.absent}
            `;
        } else {
            document.getElementById('result').innerText = `Error: ${result.message}`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'An error occurred. Please try again.';
    }
});
