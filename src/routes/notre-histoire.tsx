import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notre-histoire")({
  component: NotreHistoire,
});

function NotreHistoire() {
  return (
    <div className="container mx-auto py-16">
      <h1 className="text-4xl font-bold mb-8">
        Notre Histoire
      </h1>

      <p>
        L'histoire d'Agro Konnecte Sénégal est née d'un besoin concret...
      </p>
    </div>
  );
}
