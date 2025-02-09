import { transporter } from "~~/lib/email";
import prisma from "~~/lib/prisma/prisma";


export async function GET(request: Request) {
    const payload = await request.json();
    const repoName = payload.repoName;
    if (!repoName) {
        return Response.json({ message: "repoName is required" });
    }
    const userEmail = await prisma.contributorData.findMany({
        where: {
            repoName: repoName,
        },
        select: {
            email: true,
        },
    });
    const emails = userEmail.map((user) => user.email);
    if (emails.length === 0) {
        return Response.json({ message: "No emails found" });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails.join(","),
        subject: "Test Email from Next.js",
        text: "Hello! This is a test email from Next.js API route.",
    };
    await transporter.sendMail(mailOptions);
    return Response.json({ message: "Email sent successfully!" });
}