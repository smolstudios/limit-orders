export default function SlugLayout({
    children, // will be a page or nested layout
    params,
  }: {
    children: React.ReactNode,
    params: any,
  }) {
    return (
      <>
        {children}
      </>
    );
  }