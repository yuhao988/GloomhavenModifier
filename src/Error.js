import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div style={{ marginLeft: "20vw", width: "60vw" }}>
      <h1 >Oops, you are not suppose to see this page</h1>
      <Link to={`${process.env.PUBLIC_URL}`}>Return home</Link>{" "}
    </div>
  );
}