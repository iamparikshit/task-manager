const sgmail = require('@sendgrid/mail')
sgmail.setApiKey(process.env.SENDGRID_API_KEY)

sgmail.send({
    to : 'shraddha.dhope.25@gmail.com',
    from : 'public.parikshit@gmail.com',
    subject:'This is my first creation from Task App',
    text:'I am hope this one actually gets to you.'
})

const sendWelcomeEmail = (email, name) =>{
    sgmail.send({
        to : email,
        from : 'public.parikshit@gmail.com',
        subject:'Thanks for joining in!',
        text:`Welcome to the Task App, ${name}. Let me know how you get along with the app.`
    })
}

const sendQuitMail = (email, name) =>{
    sgmail.send({
        to : email,
        from : 'public.parikshit@gmail.com',
        subject:`Good bye ${name}, we will miss you.`,
        text:`Good bye ${name}. Please let us know, how was your journey with us? You can always sign up the Task App in future. Have a great day.`
    })
}

 module.exports = {
    sendWelcomeEmail,
    sendQuitMail
 }