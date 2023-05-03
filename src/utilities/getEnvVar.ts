export const getEnvVar = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Payload Cloud plugin missing env var: ${name}`)
  return value
}
