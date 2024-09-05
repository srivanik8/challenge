import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
let client

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

export default async function handler(req, res) {
  try {
    if (!client) {
      client = new MongoClient(uri)
      await client.connect()
    }
    
    const database = client.db("taskmanager")
    const tasksCollection = database.collection("tasks")

    switch (req.method) {
      case 'GET':
        const tasks = await tasksCollection.find().toArray()
        res.status(200).json(tasks)
        break
      case 'POST':
        const newTask = req.body
        const result = await tasksCollection.insertOne(newTask)
        res.status(201).json(result)
        break
      case 'PUT':
        const { id, ...updateData } = req.body
        await tasksCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
        res.status(200).json({ message: 'Task updated successfully' })
        break
      case 'DELETE':
        if (req.query.id) {
          await tasksCollection.deleteOne({ _id: new ObjectId(req.query.id) })
          res.status(200).json({ message: 'Task deleted successfully' })
        } else {
          await tasksCollection.deleteMany({})
          res.status(200).json({ message: 'All tasks deleted successfully' })
        }
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API route error:', error)
    res.status(500).json({ message: error.message })
  }
}
