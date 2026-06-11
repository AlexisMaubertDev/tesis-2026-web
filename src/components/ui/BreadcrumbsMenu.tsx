import { Breadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "@mui/material/Link";

interface Props {
  page: string;
}

export default function BreadcrumbsMenu({ page }: Props) {
  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" />}
      classes={{ root: "text-sm! text-cerulean-600! font-bold!" }}
    >
      <Link href="/" underline="hover" color="inherit">
        Inicio
      </Link>
      <span>{page}</span>
    </Breadcrumbs>
  );
}
