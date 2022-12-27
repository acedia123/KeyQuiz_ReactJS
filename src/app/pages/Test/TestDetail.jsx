import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Grid, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { CloseOutlined, FilterList } from '@mui/icons-material';
import CustomIconAction from '../../components/Share/CustomIconAction';
import { IMAGE_PATH } from '../../appConfig';
import CustomTippyPopper from '../../components/Share/CustomTippyPopper';
import { routes } from '../../configs';
import { useDispatch } from 'react-redux';
import TestResult from './TestResult';
import { getTestResult, getTestProcessing } from '../../redux/test/actions';
import { Box } from '@mui/system';

import classNames from 'classnames/bind';
import styles from './Test.module.scss';

const cx = classNames.bind(styles);

export default function TestDetail() {
    let navigate = useNavigate();
    let dispatch = useDispatch();
    let location = useLocation();
    const { id } = useParams();
    const [popper, setPopper] = useState(false);

    const [data, setData] = useState();

    const [refs, setRefs] = useState([]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

        if (location.state != null) {
            dispatch(
                getTestResult.getTestResultSuccess({
                    successTime: location.state.correct_count,
                    wrongTime: location.state.wrong_count,
                    openResult: true,
                }),
            );

            let testProcess = location.state.questions.map((item) => {
                let userChoose = JSON.parse(item.user_answers);
                let answers = JSON.parse(item.answers);
                let userChooseConvert = userChoose.map((choose) => {
                    return { index: answers.findIndex((ans) => ans === choose), answer: choose };
                });
                return {
                    ...item,
                    id: item.question_id,
                    userChoose: userChooseConvert,
                    answers,
                    correct_answers: JSON.parse(item.correct_answers),
                };
            });
            dispatch(getTestProcessing.getTestProcessingSuccess(testProcess));
            setData({ ...location.state, testProcessing: testProcess });
        }
        return () => {
            dispatch(getTestResult.getTestResultSuccess({ wrongTime: 0, successTime: 0, openResult: false }));
            dispatch(getTestProcessing.getTestProcessingSuccess([]));
        };
    }, []);

    useEffect(() => {
        if (data) {
            const refsResult = data.testProcessing.reduce((acc, value) => {
                acc[value.id] = React.createRef();
                return acc;
            }, {});
            setRefs(refsResult);
        }
    }, [data]);

    const show = () => setPopper(true);
    const hide = () => setPopper(false);

    const handleCloseTest = () => {
        navigate(routes.courseDetail + '/' + id);
    };

    const handleClickResult = (id) => {
        refs[id].current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            {data && (
                <div className={cx('wrapper')}>
                    <Grid container alignItems="center" justifyContent="space-between" className={cx('header')}>
                        <div className="d-flex">
                            <div className={cx('logo-wrapper')}>
                                <Link to="/">
                                    <img
                                        className="w-100 h-100"
                                        src={IMAGE_PATH + '/logos/logo-large-nbg.png'}
                                        alt="Logo"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className={cx('header-title')}>
                            {(data.time.split(':')[0] > 9 ? data.time.split(':')[0] : '0' + data.time.split(':')[0]) +
                                ':' +
                                (data.time.split(':')[1] > 9
                                    ? data.time.split(':')[1]
                                    : '0' + data.time.split(':')[1]) +
                                ':' +
                                (data.time.split(':')[2] > 9 ? data.time.split(':')[2] : '0' + data.time.split(':')[2])}
                        </div>
                        <div className={cx('header-actions')}>
                            <CustomTippyPopper
                                className={cx('user-avatar-popper')}
                                interactive={true}
                                placement="bottom"
                                visible={popper}
                                // handleClosePopper={hide}
                                popperRender={
                                    <ul className={cx('questions-wrapper')}>
                                        {data.testProcessing.map((test, index) => {
                                            let checkStatus = '--is-wrong';
                                            if (test.userChoose[index]) {
                                                checkStatus = test.userChoose.every((item) =>
                                                    test.correct_answers.includes(item.answer),
                                                )
                                                    ? '--is-correct'
                                                    : '--is-wrong';
                                            }

                                            return (
                                                <li>
                                                    <Link
                                                        onClick={() => handleClickResult(test.question_id)}
                                                        className={cx('btn-question', checkStatus)}
                                                    >
                                                        {index + 1}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                }
                            >
                                <Tooltip
                                    arrow={true}
                                    title={popper ? '' : <Typography className="small-font">List Questions</Typography>}
                                >
                                    <IconButton onClick={popper ? hide : show} className={cx('kq-btn')}>
                                        <FilterList className={cx('icon')} />
                                    </IconButton>
                                </Tooltip>
                            </CustomTippyPopper>

                            <CustomIconAction
                                label={'Close'}
                                arrow={true}
                                className={cx('kq-btn', 'ml-3')}
                                handleClick={handleCloseTest}
                                icon={<CloseOutlined className={cx('icon')} />}
                            />
                        </div>
                        <Box sx={{ width: '100%', position: 'absolute', bottom: '-4px', right: 0, left: 0 }}>
                            <LinearProgress variant="determinate" value={0} />
                        </Box>
                    </Grid>

                    <div className={cx('main', 'questions', 'd-flex')}>
                        <TestResult refs={refs} />
                    </div>
                </div>
            )}
        </>
    );
}