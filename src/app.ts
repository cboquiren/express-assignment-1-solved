import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line
const validKeys = ['name', 'age', 'description', 'breed'];

// Index Endpoint
app.get("/dogs", async (req,res) => {
  const dogs = await prisma.dog.findMany();
  res.status(200).send(dogs);
});

// Show Endpoint
app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id
  if (isNaN(id)) {
    return res.status(400).send({message: "id should be a number"});
  }
  const foundDog = await prisma.dog.findUnique({
    where: {
      id
    }
  })
  if (foundDog === null) {
    return res.status(204).send()
  }
  return res.status(200).send(foundDog);
});

// Destroy Endpoint
app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res.status(400).send({message: "id should be a number"})
  }
  const deleted = await Promise.resolve()
    .then(() =>  prisma.dog.delete({
      where: {
        id
      }
    }))
    .catch(() => null);

  if (deleted === null) {
    return res.status(204).send({error: "Dog Not Found"})
  }
  return res.status(200).send(deleted)
})


// Create Endpoint
app.post("/dogs", async (req, res) => {
  const body = req.body;
  const age = body?.age;
  const name = body?.name;
  const description = body?.description;
  const breed = body?.breed;
  const keys = Object.keys(body)

  const errArr: string[] = []
  if (typeof age !== "number") {
    errArr.push("age should be a number")
  }
  if (typeof name !== "string") {
    errArr.push("name should be a string")
  }
  if (typeof description !== "string") {
    errArr.push("description should be a string")
  }
  if (typeof breed !== "string") {
    errArr.push("breed should be a string")
  }

  keys.forEach((key) => {
    if (!validKeys.includes(key)) {
      errArr.push(`'${key}' is not a valid key`)
    }
  })

  const createDog = await Promise.resolve().then(() => {
    return prisma.dog.create({
      data: {
        age,
        name,
        description,
        breed
      }
    })
  }).catch(()=> null);

  if (createDog === null) {
    return res.status(400).send({errors: errArr})
  }
  return res.status(201).send({message: "Dog Created Successfully"})
})

// Update Endpoint
app.patch("/dogs/:id", async (req, res) => {
  const body = req.body;
  const id = +req.params.id
  const keys = Object.keys(body);
  const errArr: string[] = [];

  keys.forEach((key) => {
    if (!validKeys.includes(key)) {
      errArr.push(`'${key}' is not a valid key`)
    }
  })

  const updateDog = await Promise.resolve().then(() => {
    return prisma.dog.update({
      where: {
        id,
      },
      data: body
    })
  }).catch(() => null);

  if (updateDog === null) {
    return res.status(400).send({errors: errArr})
  }
  return res.status(201).send(body)

})

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`),
);
