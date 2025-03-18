import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prismaClient } from "./prisma";
import { error } from "console";

const hono = new Hono();

hono.get("/contacts", async (context) => {
  try {
    const contacts = await prismaClient.contact.findMany();

    return context.json(contacts, 200);
  } catch (e) {
    return context.json({ error: "Server Issue" }, 500);
  }
});

hono.post("/contacts", async (context) => {
  try {
    const { name, phoneNumber, email } = await context.req.json();

    const existingContact = await prismaClient.contact.findFirst({
      where: {
        OR: [
          {
            phoneNumber,
          },
          {
            email,
          },
        ],
      },
    });

    if (existingContact) {
      return context.json({ error: "Contact already exists" }, 400);
    } else {
      const newContact = await prismaClient.contact.create({
        data: {
          name,
          phoneNumber,
          email,
        },
      });

      return context.json(newContact, 201);
    }
  } catch (e) {
    return context.json({ error: "Server Issue" }, 500);
  }
});

hono.patch("/contacts/:id/email", async (context) => {
  const { id } = context.req.param();
  const { email } = await context.req.json();

  try {
    const existingContact = await prismaClient.contact.findUnique({
      where: {
        id,
      },
    });

    if (!existingContact) {
      return context.json({ error: "Bad Request" }, 400);
    }

    const existingContactWithGivenEmail = await prismaClient.contact.findUnique({
      where: {
        email,
      },
    });

    if (existingContactWithGivenEmail) {
      return context.json({ error: "Bad Request" }, 400);
    }

    const updatedContact = await prismaClient.contact.update({
      where: {
        id,
      },
      data: {
        email,
      },
    });

    return context.json(updatedContact, 200);
  } catch (e) {
    return context.json({ error: "Server Issue" }, 500);
  }
});

hono.delete("/contact/:id", async (context) => {
  try {
    const { id } = context.req.param();

    const existingContact = await prismaClient.contact.findUnique({
      where: {
        id,
      },
    });

    if (!existingContact) {
      return context.json({ error: "Bad Request" }, 400);
    }

    await prismaClient.contact.delete({
      where: {
        id,
      },
    });
  } catch (e) {
    return context.json({ error: "Server Issue" }, 500);
  }
});

serve(hono, (info) => {
  console.log("Server is running on http://localhost:" + info.port);
});