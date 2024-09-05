import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db("taskmanager")
    const collection = db.collection("tasks")

    switch (req.method) {
      case 'GET':
        const tasks = await collection.find({}).toArray()
        const formattedTasks = tasks.reduce((acc, task) => {
          if (!acc[task.user]) acc[task.user] = []
          acc[task.user].push({
            id: task._id.toString(),
            text: task.text,
            completed: task.completed
          })
          return acc
        }, {
          Srivani: [],
          Prem: [],
          Ashish: [],
          Manish: []
        })
        res.json(formattedTasks)
        break

      case 'POST':
        const newTask = {
          user: req.body.user,
          text: req.body.text,
          completed: false
        }
        const result = await collection.insertOne(newTask)
        res.json({ id: result.insertedId, ...newTask })
        break

      case 'PUT':
        const { id, ...updateData } = req.body
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        )
        res.json({ success: true })
        break

      case 'DELETE':
        const { id: deleteId } = req.query
        await collection.deleteOne({ _id: new ObjectId(deleteId) })
        res.json({ success: true })
        break

      default:
        res.status(405).end()
    }
  } catch (error) {
    console.error("API Error:", error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
