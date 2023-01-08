import Head from 'next/head';

export default function CustomHead({
  title,
  description,
  author,
  keywords,
  image,
  imageAlt,
  type,
}) {
  const origin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

  const toCapitalize = function (text) {
    let split = text.toLowerCase().split(' ');
    return split
      .map((i) => {
        let n = i.split('');
        n[0] = n[0].toUpperCase();
        return n.join('');
      })
      .join(' ');
  };

  return (
    <Head>
      {title ? (
        <>
          <title>{`${toCapitalize(title)} ${
            author ? (author.name ? `| by ${author.name}` : `| by @${author.username}`) : ''
          } | Write You Want`}</title>
          <meta name="twitter:title" content={title} />
          <meta name="og:title" content={title} />
        </>
      ) : null}

      {author ? (
        <>
          <meta name="author" content={author.name} />
          <link rel="author" href={origin + '/' + author.username} />
          <meta name="article:author" content={origin + '/' + author.username} />
        </>
      ) : null}
      {keywords ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      {description ? (
        <>
          <meta name="description" content={description} key="description" />
          <meta name="twitter:description" content={description} />
          <meta name="og:description" content={description} />
        </>
      ) : null}
      {image ? (
        <>
          <meta name="twitter:image" content={image == '/profile.jpg' ? origin + image : image} />
          <meta name="og:image" content={image == '/profile.jpg' ? origin + image : image} />
        </>
      ) : null}
      {imageAlt ? (
        <>
          <meta name="twitter:image:alt" content={toCapitalize(imageAlt)} />
          <meta name="og:image:alt" content={toCapitalize(imageAlt)} />
        </>
      ) : null}
      {type ? <meta name="og:type" content={type} key="type" /> : null}
    </Head>
  );
}
