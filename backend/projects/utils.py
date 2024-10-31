import yagmail
import os

def send_email_with_yagmail(to_email, subject, message):
    try:
        yag = yagmail.SMTP(os.getenv("EMAIL_HOST_USER"), os.getenv("EMAIL_HOST_PASSWORD"))
        
        yag.send(
            to=to_email,
            subject=subject,
            contents=message
        )
        print("Correo enviado con éxito")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")
