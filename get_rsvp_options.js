async function sendRsvpOptions(firstName, lastName, email) {
    const endpoint = "https://hook.us1.make.com/8y6oj5hfas1ap2sqccrrr5dfrhhco9fp";
    const data = {
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}