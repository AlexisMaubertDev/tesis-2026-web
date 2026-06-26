import { Breadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "@mui/material/Link";

interface Links {
  name: string;
  href: string;
}
interface Props {
  page: string;
  links?: Links[];
}

export default function BreadcrumbsMenu({ page, links }: Props) {
  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" />}
      classes={{ root: "text-sm! text-cerulean-600! font-bold!" }}
    >
      <Link href="/" underline="hover" color="inherit">
        Inicio
      </Link>
      {links?.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          underline="hover"
          color="inherit"
        >
          {link.name}
        </Link>
      ))}
      <span>{page}</span>
    </Breadcrumbs>
  );
}
