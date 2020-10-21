# A-Tracking

pip install -r requirements.txt
pip install ptvsd -t src/build/
cp src/event-receiver.py src/build/

sam local invoke EventReceiverFunction -d 5890


python -m pytest tests/ -v