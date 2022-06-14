import Xvfb from 'xvfb';

export default() => {
    const xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1280x720x24', "-ac"]
    });
    xvfb.start((err) => {
        if (err) {
            console.error(err);
        }
    })
    return xvfb;
}
