import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔑 Token cargado:', process.env.HUGGINGFACE_API_KEY);
const runTest = async () => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/Hello-SimpleAI/chatgpt-detector-roberta',
      { inputs: 'Este es un texto de prueba para ver si lo detecta como IA.' },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    console.log('✅ Token válido. Respuesta:');
    console.log(response.data);
  } catch (err) {
    console.error('❌ Token inválido o no autorizado');
    console.error(err.response?.status, err.response?.data);
  }
};

runTest();
