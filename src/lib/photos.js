const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

async function signStoragePath(supabase, path) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from("photos")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return path;
  }

  return data.signedUrl;
}

export async function signPhotoRecord(supabase, photo) {
  const [url, thumbnailUrl] = await Promise.all([
    signStoragePath(supabase, photo.url),
    signStoragePath(supabase, photo.thumbnail_url),
  ]);

  return {
    ...photo,
    url: url ?? photo.url,
    thumbnail_url: thumbnailUrl ?? url ?? photo.thumbnail_url,
  };
}

export async function signPlacesPhotos(supabase, places) {
  return Promise.all(
    places.map(async (place) => {
      if (!place.photos?.length) {
        return place;
      }

      const photos = await Promise.all(
        place.photos.map((photo) => signPhotoRecord(supabase, photo)),
      );

      return {
        ...place,
        photos,
      };
    }),
  );
}

export async function signAlbumPhotos(supabase, photos) {
  return Promise.all(photos.map((photo) => signPhotoRecord(supabase, photo)));
}
