import { Link as MuiLink, styled } from "@mui/material"
import Link from "next/link"

const FooterDiv = styled("footer")(({ theme }) => ({
  margin: `${theme.spacing(1)} auto`,
  padding: theme.spacing(4),
  minWidth: theme.spacing(40),
  maxWidth: theme.spacing(70),
  width: "100%",
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.typography.body2
}))

export const Footer = () => {
  return (
    <FooterDiv>
      Made with ❤️ by{" "}
      <Link href="https://twitter.com/msokola" passHref>
        <MuiLink target="_blank" rel="noopener referrer">
          Matéu.sh
        </MuiLink>
      </Link>
    </FooterDiv>
  )
}
