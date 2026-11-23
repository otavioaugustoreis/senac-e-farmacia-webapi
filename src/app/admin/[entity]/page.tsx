import { notFound } from "next/navigation";
import { EntityManager } from "@/components/admin/EntityManager";
import { ENTITIES, type Entity } from "@/components/admin/entities";

export default async function EntityPage({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  if (!ENTITIES.includes(entity as Entity)) notFound();
  return <EntityManager entity={entity as Entity} />;
}
