require('dotenv').config();
const morgan = require('morgan');
const app = require('./App');

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));  
} else {
  app.use(morgan('dev')); 
}
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
