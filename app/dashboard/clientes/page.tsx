import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function CustomersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Ver todos los clientes y sus pedidos.</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
