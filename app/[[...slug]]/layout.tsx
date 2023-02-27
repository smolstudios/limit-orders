export default function SlugLayout({
    children, // will be a page or nested layout
    params,
  }: {
    children: React.ReactNode,
    params: any,
  }) {
    console.log('SlugLayout:params', params.slug)
    return (
      <>
        {children}
      </>
    );
  }