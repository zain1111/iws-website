import { Navigate, useParams } from "react-router-dom";

/** Keeps old /blog/:slug links working by sending them to /:slug. */
export default function BlogPostRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/${slug ?? ""}`} replace />;
}
