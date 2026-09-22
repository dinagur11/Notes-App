import app from './expressApp.ts'
import connectDB from './config/db.ts'

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});