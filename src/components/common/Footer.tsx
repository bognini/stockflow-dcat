export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StockFlow DCAT. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
