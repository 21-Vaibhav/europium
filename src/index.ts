import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
const app = new Hono()
const prisma = new PrismaClient()
// GET /contacts
app.get("/contacts", async (context) => {
  try {
    const contact = await prisma.contact.findMany()
    return context.json({contact}, 200)
  }
  catch {
    return context.json({error: " Error fetching contacts"}, 404)
  }
});
// POST /contacts
app.post("/contacts", async (context) => {
  const { name, phoneNumber, email } = await context.req.json();
  try {
    const contact = await prisma.contact.create(
      {
        data: { name: name, phoneNumber: phoneNumber, email: email }
      });
    return context.json(contact, 201);
  }
  catch {
    return context.json({ error: "404 Not Found: Error creating contact" }, 404);
  }
});
// PATCH /contacts/:id
app.patch("/contacts/:id", async (context) => {
  const id = context.req.param("id");
  const { name, phoneNumber, email } = await context.req.json();
  try {
    const con = await prisma.contact.update({
      where: { id: id },
      data: { name:name , phoneNumber: phoneNumber, email: email },
    });
    return context.json(
      {
        contact: con
      }, 200);
  }
  catch {
    return context.json({ error: "404 Not Found: Error updating contact" }, 404);
  }
});
// DELETE /contacts/:id
app.delete("/contacts/:id", async (context) => {
  const id = context.req.param("id");
  try {
    const con = await prisma.contact.delete(
      {
        where: { id: id }
      });
    return context.json({contact: con}, 200)
  }
  catch {
    return context.json({ error: "404 Not Found: Error deleting contact" }, 404);
  }
});
serve(app)















