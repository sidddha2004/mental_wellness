import app from './src/app.js'
import 'dotenv/config';

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Youth Wellness MCP Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});