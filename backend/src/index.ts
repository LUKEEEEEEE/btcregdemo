import app from './App';

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
    return err
        ? console.log(err)
        : console.log(`server is listening on ${port}`);
});