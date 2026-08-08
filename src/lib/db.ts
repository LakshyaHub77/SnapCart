import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDb = async () => {
  const mongodbUrl = process.env.MONGODB_URL;

  if (!mongodbUrl) {
    throw new Error("MONGODB_URL is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUrl)
      .then((conn) => conn.connection);
  }

  try {
    const conn = await cached.promise;
    return conn;
  } catch (error) {
    cached.promise = null;
    console.log(error);
    throw error;
  }
};

export default connectDb;