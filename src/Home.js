import React, { useState, useRef, useEffect } from "react";
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
  Checkbox,
  Button,
  ButtonGroup
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import qs from "qs";
import _filter from "lodash/filter";
import _fromPairs from "lodash/fromPairs";

const NO_CITY = "Без города";

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

  const [state, setState] = useState({});

  // Клик по чекбоксу с городом
  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const selectCities = value => {
    let cities = {};
    Object.keys(state).map(city => (cities[city] = value));
    setState(cities);
  };

  // Собрать города после получения результатов
  useEffect(() => {
    if (searchResult.length) {
      let cities = [];
      searchResult.map(result => {
        const city = result.city ? result.city.title : NO_CITY;
        cities.push([city, true]);
      });
      setState(
        _fromPairs(
          cities.sort(([a], [b]) => {
            // Сортировка [Без города, Москва, Санкт-Петербург, ...]
            if (a.toLowerCase() == NO_CITY.toLowerCase()) {
              return -1;
            }
            if (b.toLowerCase() == NO_CITY.toLowerCase()) {
              return 1;
            }

            if (a.toLowerCase() == "москва") {
              return -1;
            }
            if (b.toLowerCase() == "москва") {
              return 1;
            }

            if (a.toLowerCase() == "санкт-петербург") {
              return -1;
            }
            if (b.toLowerCase() == "санкт-петербург") {
              return 1;
            }

            return 0;
          })
        )
      );
    }
  }, [searchResult]);

  const resultPlaceholder = "Для старта парсинга необходимо авторизоваться.";
  ('Добавь ссылку на пост и страница выдаст id всех пользователей которые поставили "Мне нравится". Результат можно отфильтровать по городам пользователей.');

  const filter = [];
  Object.keys(state).map(city => (state[city] ? filter.push(city) : null));

  const filteredResult = getResult(searchResult, filter);

  return [
    <CssBaseline />,
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {!isAuthenticated() ? (
            <IconButton onClick={auth} style={{ borderRadius: 0 }}>
              <VpnKeyIcon />
              <span style={{ fontSize: "1rem", paddingLeft: "0.3rem" }}>
                Авторизоваться
              </span>
            </IconButton>
          ) : (
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
                placeholder="Ссылка на пост (https://vk.com/garyanikin?w=wall7664296_3242)"
                inputRef={searchRef}
              />
              <IconButton onClick={search}>
                <SearchIcon />
              </IconButton>
            </Paper>
          )}
        </Grid>
        <Grid item xs={8}>
          {searchResult.length ? (
            <h4 style={{ marginTop: "0" }}>
              Количество юзеров: {filteredResult.length}
            </h4>
          ) : null}
          <div>
            {searchResult.length
              ? printResult(filteredResult)
              : resultPlaceholder}
          </div>
        </Grid>
        <Grid item xs={4}>
          <h3 style={{ margin: 0 }}>Города:</h3>
          <ButtonGroup size="small" aria-label="small outlined button group">
            <Button onClick={() => selectCities(true)}>Все</Button>
            <Button onClick={() => selectCities(false)}>Никакие</Button>
          </ButtonGroup>
          <FormGroup>
            {Object.keys(state).map(city => (
              <FormControlLabel
                key={city}
                control={
                  <Checkbox
                    key={city}
                    checked={state[city]}
                    color="primary"
                    onChange={handleChange(city)}
                    value={city}
                  />
                }
                label={city}
              />
            ))}
          </FormGroup>
        </Grid>
      </Grid>
    </Container>
  ];
};

// Получить hash из адресной строки
function getHash() {
  return typeof location !== "undefined" ? location.hash.substr(1) : "";
}

// Проверка на авторизацию
function isAuthenticated() {
  return getHash().search("access_token") !== -1;
}

// Редирект на страницу авторизации
function auth(search = "") {
  location.href = `/auth${search ? `?search=${search}` : ""}`;
}

// Получить список юзеров по post_url
function getSearchResult({ post_url, access_token }) {
  return fetch(`/getLikes?post_url=${post_url}&access_token=${access_token}`);
}

function getResult(result, filter = []) {
  const filteredResult = [];

  // Добавляем к результату юзера
  result.map(user => {
    if (filter) {
      // Если у пользователя есть город и выбран чекбокс для этого города
      if (user.city && filter.indexOf(user.city.title) !== -1) {
        filteredResult.push(user.id);
      }

      // Если у пользователя нет города и выбран чекбокс для этого "Без города"
      if (filter.indexOf(NO_CITY) !== -1) {
        filteredResult.push(user.id);
      }
    } else {
      // Если нет фильтра добавляем всех пользователей
      filteredResult.push(user.id);
    }
  });

  return filteredResult;
}

// Напечатать результат
function printResult(result) {
  return result.join(", ");
}

export default Home;
