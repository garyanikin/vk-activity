import React, { useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  CssBaseline,
  Grid,
  Paper,
  InputBase,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import qs from "qs";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: "1rem",
    display: "flex"
  },
  input: {
    paddingLeft: "1rem",
    flex: 1
  }
}));

const Home = props => {
  const searchRef = useRef();
  const [searchResult, setSearchResult] = useState([]);
  const classes = useStyles();
  const getSearchValue = () => searchRef.current.value;
  const search = () => {
    if (!getSearchValue()) return;

    if (isAuthenticated()) {
      const { access_token } = qs.parse(getHash());

      getSearchResult({
        access_token,
        post_url: getSearchValue()
      }).then(async response =>
        response.ok ? setSearchResult(await response.json()) : null
      );
    } else {
      auth(getSearchValue());
    }
  };

  const [state, setState] = useState({
    gilad: true,
    jason: true,
    antoine: true
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const resultPlaceholder =
    'Добавь ссылку на пост и страница выдаст id всех пользователей которые поставили "Мне нравится".';
  // Результат можно отфильтровать по городам пользователей.

  return [
    <CssBaseline />,
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            style={{
              marginTop: "1rem",
              display: "flex"
            }}
            component="form"
          >
            <InputBase
              style={{
                paddingLeft: "1rem",
                flex: 1
              }}
              fullWidth
              placeholder="Ссылка на пост"
              inputRef={searchRef}
            />
            <IconButton onClick={search}>
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          {searchResult.length ? (
            <h4 style={{ marginTop: "0" }}>IDs: {searchResult.length}</h4>
          ) : null}
          <div>
            {searchResult.length
              ? printResult(searchResult)
              : resultPlaceholder}
          </div>
        </Grid>
        {/* <Grid item xs={4}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state["gilad"]}
                  color="primary"
                  onChange={handleChange("gilad")}
                  value="gilad"
                />
              }
              label="Gilad Gray"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state["jason"]}
                  color="primary"
                  onChange={handleChange("jason")}
                  value="jason"
                />
              }
              label="Jason Killian"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state["antoine"]}
                  color="primary"
                  onChange={handleChange("antoine")}
                  value="antoine"
                />
              }
              label="Antoine Llorca"
            />
          </FormGroup>
        </Grid> */}
      </Grid>
    </Container>
  ];
};

function getHash() {
  return location.hash.substr(1);
}

function isAuthenticated() {
  return getHash().search("access_token") !== -1;
}

function auth(search = "") {
  location.href = `/auth${search ? `?search=${search}` : ""}`;
}

function getSearchResult({ post_url, access_token }) {
  return fetch(`/getLikes?post_url=${post_url}&access_token=${access_token}`);
}

function printResult(result, filter = false) {
  return filter ? null : result.map(user => user.id).join(", ");
}

export default Home;
