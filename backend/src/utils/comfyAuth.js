export const getComfyAuth = () => ({
  auth: {
    username: process.env.COMFY_AUTH_USER,
    password: process.env.COMFY_AUTH_PASS
  }
});